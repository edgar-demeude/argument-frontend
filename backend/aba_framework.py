"""
ABAFramework: Represents an Assumption-Based Argumentation (ABA) framework
with support for ABA+ (preference-based attacks between assumption sets).

Features:
- Supports classical ABA argument and attack generation.
- Transforms to atomic ABA framework if needed.
- Generates all combinations of base assumptions.
- Generates normal and reverse attacks between assumption sets for ABA+.
- Provides visualization of attack graphs using PyVis.
"""

from argument import Argument
from contrary import Contrary
from literal import Literal
from rule import Rule
from attacks import Attacks
from collections import deque, defaultdict
from itertools import combinations, product
from pyvis.network import Network


class ABAFramework:
    """
    Represents an Assumption-Based Argumentation (ABA) framework.

    Attributes:
        language (set[Literal]): The set of all literals in the framework.
        rules (set[Rule]): The set of all rules in the framework.
        assumptions (set[Literal]): The set of all assumptions in the framework.
        base_assumptions (set[Literal]): Original assumptions before atomic transformation.
        contraries (set[Contrary]): The set of all contrary relationships.
        preferences (dict[Literal, set[Literal]]): Maps literals to literals they are preferred over.
        arguments (set[Argument]): Set of all generated arguments.
        attacks (set[Attacks]): Standard attacks between arguments (classical ABA).
        normal_attacks (set[tuple]): Normal ABA+ attacks between assumption sets.
        reverse_attacks (set[tuple]): Reverse ABA+ attacks due to preferences.
        assumption_combinations (list[set[Literal]]): All subsets of base assumptions.
    """

    def __init__(self, language: set[Literal], rules: set[Rule], assumptions: set[Literal],
                 contraries: set[Contrary], preferences: dict[Literal, set[Literal]] = None):
        self.language = language
        self.rules = rules
        self.assumptions = assumptions
        self.base_assumptions = set(assumptions)  # save original assumptions
        self.contraries = contraries
        self.preferences = preferences if preferences is not None else {}
        self.arguments = set()
        self.attacks = set()  # classical argument-to-argument attacks
        self.normal_attacks = set()  # ABA+ normal attacks (assumption sets)
        self.reverse_attacks = set()  # ABA+ reverse attacks (assumption sets)
        self.assumption_combinations = []

    def __eq__(self, other):
        return (
            isinstance(other, ABAFramework) and
            self.language == other.language and
            self.rules == other.rules and
            self.assumptions == other.assumptions and
            self.contraries == other.contraries
        )

    def __str__(self):
        """Return string representation of ABA framework, including preferences and arguments."""
        language_str = ', '.join(str(l) for l in sorted(self.language, key=str))
        rules_str = '\n'.join(str(r) for r in sorted(self.rules, key=str))
        assumptions_str = ', '.join(str(a) for a in sorted(self.assumptions, key=str))
        contraries_str = ', '.join(str(c) for c in sorted(self.contraries, key=str))
        result = [
            f"L = {{{language_str}}}",
            f"R = {{\n{rules_str}\n}}",
            f"A = {{{assumptions_str}}}",
            f"CONTRARIES = {{{contraries_str}}}"
        ]
        if self.preferences:
            sorted_prefs = sorted(self.preferences.items(), key=lambda x: str(x[0]))
            preferences_str = '\n'.join(
                f"  {str(literal)} > {{{', '.join(str(p) for p in sorted(prefs, key=str))}}}"
                for literal, prefs in sorted_prefs
            )
            result.append(f"PREFERENCES:\n{preferences_str}")
        if self.arguments:
            arguments_str = '\n'.join(str(arg) for arg in sorted(self.arguments, key=str))
            result.append(f"ARGS:\n{arguments_str}")
        return '\n'.join(result)

    def __hash__(self):
        return hash((frozenset(self.language), frozenset(self.rules),
                     frozenset(self.assumptions), frozenset(self.contraries)))

    # ------------------------- Core Methods -------------------------

    def is_preferred(self, lit1: Literal, lit2: Literal) -> bool:
        """Return True if lit1 is strictly preferred over lit2."""
        return lit1 in self.preferences and lit2 in self.preferences[lit1]

    def generate_arguments(self) -> None:
        """
        Generates all possible arguments in the ABA framework based on the rules, assumptions, and contraries.

        This method populates the self.arguments set with all arguments that can be constructed from the framework.
        """
        arg_count = 1
        arguments_by_claim = defaultdict(set)
        queue = deque()

        # Single-assumption arguments
        for a in self.assumptions:
            arg = Argument(f"A{arg_count}", a, {a})
            arguments_by_claim[a].add(arg)
            queue.append(arg)
            arg_count += 1

        # Rules with empty bodies
        for rule in self.rules:
            if not rule.body:
                arg = Argument(f"A{arg_count}", rule.head, set())
                arguments_by_claim[rule.head].add(arg)
                queue.append(arg)
                arg_count += 1

        # Generate other arguments
        while queue:
            current_arg = queue.popleft()
            for rule in self.rules:
                if current_arg.claim not in rule.body:
                    continue
                if not all(lit in arguments_by_claim for lit in rule.body):
                    continue
                body_arg_lists = [arguments_by_claim[lit] for lit in rule.body]
                for combo in product(*body_arg_lists):
                    new_leaves = set().union(*(arg.leaves for arg in combo))
                    new_arg = Argument(f"A{arg_count}", rule.head, new_leaves)
                    if new_arg not in arguments_by_claim[rule.head]:
                        arguments_by_claim[rule.head].add(new_arg)
                        queue.append(new_arg)
                        arg_count += 1

        self.arguments = set().union(*arguments_by_claim.values())

    def generate_attacks(self) -> None:
        """
        Generates all possible attacks between arguments based on the contraries in the ABA framework.

        This method populates the self.attacks set with all attacks that can be constructed from the framework.
        """
        for arg1 in self.arguments:
            for arg2 in self.arguments:
                for contrary in self.contraries:
                    if arg1.claim == contrary.contrary_attacker and contrary.contraried_literal in arg2.leaves:
                        self.attacks.add(Attacks(arg1, arg2))



    # ------------------------- ABA Methods -------------------------
    
    def transform_aba(self) -> None:
        """
        Transforms the ABA framework to ensure it is both non-circular and atomic.

        Procedure:
            1. Checks if the framework is circular using is_aba_circular().
            2. If it is circular, calls _make_aba_not_circular() to remove circularity.
            3. If it is not circular but not atomic, calls _make_aba_atomic() to ensure atomicity.
            4. The transformation is performed in-place and modifies the framework's rules and language as needed.

        After calling this function, the ABA framework will be non-circular and atomic.
        """
        print("\n ------- Transforming ABA framework -------\n")
        if self.is_aba_circular():
            print("The ABA Framework is circular\n")
            self._make_aba_not_circular()
        elif not self.is_aba_atomic():
            print("The ABA Framework is not atomic\n")
            self._make_aba_atomic()

    def _make_aba_atomic(self) -> None:
        """
        Transforms the ABA framework into an atomic one.

        Procedure:
            1. For each literal x in the language that is not an assumption:
                - Introduce two new literals: xd and xnd (both are assumptions).
                - Add both to the language and assumptions.
            2. For each rule:
                - Replace non-assumption literals in the body with their 'xd' counterparts.
            3. For each new pair (xd, xnd):
                - Add contraries: Contrary(xd, xnd) and Contrary(xnd, x).

        After this transformation, all rule bodies contain only assumptions.

        Example:
            Original framework:
                L = {a, b, x}
                A = {a, b}
                R = { r1: a <- x }
            
            After _make_aba_atomic():
                L = {a, b, x, xd, xnd}
                A = {a, b, xd, xnd}
                R = { a <- xd }
                Contraries = { xd̄ = xnd, xnd̄ = x }
        """
        new_language = set(self.language)
        new_assumptions = set(self.assumptions)
        new_rules = set()
        new_contraries = set(self.contraries)

        # Step 1: Create xd and xnd for each non-assumption literal
        mapping = {}  # maps original non-assumption literal -> xd
        for lit in self.language:
            if lit not in self.assumptions:
                xd = Literal(f"{lit}d")
                xnd = Literal(f"{lit}nd")
                new_language.update({xd, xnd})
                new_assumptions.update({xd, xnd})
                mapping[lit] = xd
                # Add contraries
                new_contraries.add(Contrary(xd, xnd))
                new_contraries.add(Contrary(xnd, lit))

        # Step 2: Replace non-assumptions in rule bodies with xd
        for rule in self.rules:
            new_body = set()
            for lit in rule.body:
                if lit in mapping:   # replace non-assumption with xd
                    new_body.add(mapping[lit])
                else:
                    new_body.add(lit)
            new_rules.add(Rule(rule.rule_name, rule.head, new_body))

        # Step 3: Update framework
        self.language = new_language
        self.assumptions = new_assumptions
        self.rules = new_rules
        self.contraries = new_contraries

    def is_aba_atomic(self) -> bool:
        """
        Checks if the ABA framework is atomic.

        An ABA framework is atomic if every rule's body (if non-empty) consists only of assumptions.
        Returns:
            bool: True if the framework is atomic, False otherwise.
        """
        for rule in self.rules:
            if rule.body and not all(lit in self.assumptions for lit in rule.body):
                return False
        return True
    
    def is_aba_circular(self) -> bool:
        """
        Checks if the ABA framework is circular by detecting cycles in the rule dependency graph.

        Returns:
            bool: True if the framework is circular (i.e., contains a cycle), False otherwise.

        Procedure:
            - The dependency graph is constructed where each node is a literal.
            - For each rule, an edge is added from every literal in the rule's body to the rule's head.
            - A cycle in this graph means there is a sequence of rules such that a literal can be derived from itself,
              directly or indirectly, which is the definition of circularity in ABA frameworks.
            - The function uses depth-first search (DFS) to detect cycles in the graph.
        """
        # Build adjacency list: for each literal, store the set of literals it can reach via rules
        adj = {lit: set() for lit in self.language}
        for rule in self.rules:
            for body_lit in rule.body:
                adj[body_lit].add(rule.head)

        def has_cycle(lit, visited, stack):
            """
            Helper function to perform DFS and detect cycles.

            Args:
                lit: The current literal being visited.
                visited: Set of literals that have been fully explored.
                stack: Set of literals in the current DFS path (recursion stack).

            Returns:
                True if a cycle is detected starting from 'lit', False otherwise.
            """
            visited.add(lit)
            stack.add(lit)
            for neighbor in adj.get(lit, []):
                if neighbor not in visited:
                    if has_cycle(neighbor, visited, stack):
                        return True
                elif neighbor in stack:
                    # Found a back edge, which means a cycle exists
                    return True
            stack.remove(lit)
            return False

        visited = set()
        # Check for cycles starting from each literal in the language
        for lit in self.language:
            if lit not in visited:
                if has_cycle(lit, visited, set()):
                    return True  # Cycle found
        return False  # No cycles
        
    def _make_aba_not_circular(self) -> None:
        """
        Transforms the ABA framework to a non-circular one by renaming heads and bodies of rules.

        Procedure:
            1. Compute k = |language| - |assumptions|.
            2. For each atomic rule (body is empty or only contains assumptions):
                - Create new rules with heads renamed as x1, x2, ..., x(k-1) with the same body.
                - Keep the original atomic rule.
            3. For each non-atomic rule (body contains non-assumptions):
                - Create k-1 new rules with heads renamed as x2, x3, ... and bodies renamed by iteration index.
                - In the last iteration (i = k-1), keep the original head but update the body with the last renamed literals.
            4. Update the framework's language and rules with the new transformed rules.

        After this transformation, circular dependencies in arguments are eliminated.
        The function modifies the ABAFramework in-place and does not return any value.

        Example:
            Original framework:
                Language: {a, b, x, y}
                Assumptions: {a, b}
                Rules:
                    r1: y <- y
                    r2: x <- x
                    r3: x <- a

            After _make_aba_not_circular():
                New rules:
                    y  <- y1
                    x  <-  x1
                    x1 <- a  
                    x  <- a  
        """
    

        k = len(self.language) - len(self.assumptions)
        new_language = set(self.language)
        new_rules = set()

        for rule in self.rules:
            if not rule.body or all(lit in self.assumptions for lit in rule.body):
                # Atomic rule: create x1, x2, ..., x(k-1)
                for i in range(1, k):
                    new_head = Literal(f"{rule.head}{i}")
                    new_body = set(rule.body)  # <<< fix: define new_body here
                    new_language.add(new_head)
                    new_rule_name = f"{rule.rule_name}_{i+1}"  # unique name
                    new_rules.add(Rule(new_rule_name, new_head, new_body))
                new_rules.add(rule)  # Keep original

            else:
                # Non-atomic: rename head and body
                for i in range(1, k):
                    if i < k - 1:
                        new_head = Literal(f"{rule.head}{i+1}")
                    else:
                        new_head = rule.head  # last iteration keeps original head
                    new_body = {Literal(f"{lit}{i}") for lit in rule.body}
                    new_rule_name = f"{rule.rule_name}_{i+1}"
                    new_rules.add(Rule(new_rule_name, new_head, new_body))


        self.language = new_language
        self.rules = new_rules
    
 
    # ------------------------- Visualization -------------------------

    def plot_aba_graph(self, output_html="aba_graph.html"):
        """
        Generates a directed graph from the attacks in the ABA framework and plots it using pyvis.

        Args:
            output_html (str): The filename for the output HTML visualization.
        """
        # Ensure attacks are generated
        if not hasattr(self, "attacks") or not self.attacks:
            self.generate_attacks()

        net = Network(directed=True, notebook=False)

        def clean_label(arg):
            """
            Extracts only the argument ID (e.g., A1, A2) from the string representation.
            """
            raw = str(arg)
            if raw.startswith("[") and "]" in raw:
                return raw[1:raw.index("]")]  # remove [ and ]
            return raw

        # Add nodes with clean IDs
        for arg in self.arguments:
            node_id = clean_label(arg)
            net.add_node(node_id, label=node_id)

        # Add edges with cleaned attacker/target IDs
        for attack in self.attacks:
            attacker = clean_label(attack.attacker)
            target = clean_label(attack.target)
            net.add_edge(attacker, target)

        net.write_html(output_html)
        print(f"Attack graph saved to {output_html}")


    # ------------------------- ABA+ Methods -------------------------

    def make_aba_plus(self) -> None:
        """Generate ABA+ framework: assumption combinations and ABA+ attacks."""

        if not getattr(self, "base_assumptions", None):
            self.base_assumptions = set(self.assumptions)
        self.assumption_combinations = self._generate_assumption_combinations()
        print(f"Generated {len(self.assumption_combinations)} assumption combinations")
        
        self._generate_normal_reverse_attacks()
        print(f"Generated {len(self.normal_attacks)} normal attacks (assumption sets)")
        print(f"Generated {len(self.reverse_attacks)} reverse attacks (assumption sets)")

    def _generate_assumption_combinations(self) -> list[set[Literal]]:
        """Generate all subsets of base assumptions (including empty set)."""
        source_assumptions = getattr(self, "base_assumptions", self.assumptions)
        all_combos = []
        for r in range(len(source_assumptions) + 1):
            for combo in combinations(source_assumptions, r):
                all_combos.append(set(combo))
        return all_combos

    def _arguments_from_assumptions(self, S: set[Literal]) -> set[Argument]:
        """Return arguments whose leaves are subsets of S."""
        return {arg for arg in self.arguments if arg.leaves.issubset(S) or (not arg.leaves and set() <= S)}

    def _generate_normal_reverse_attacks(self) -> None:
        """
        Generate ABA+ attacks between assumption sets.

        - Normal: X -> Y if there exists ax from X attacking ay from Y
                without preference-based reversal.
        - Reverse: Y -> X if SOME y in Y is strictly preferred over SOME x in X.
        """
        self.normal_attacks.clear()
        self.reverse_attacks.clear()
        if not self.assumption_combinations:
            self.assumption_combinations = self._generate_assumption_combinations()

        for X in self.assumption_combinations:
            for Y in self.assumption_combinations:
                    
                args_X = self._arguments_from_assumptions(X)
                args_Y = self._arguments_from_assumptions(Y)
                if not args_X or not args_Y:
                    continue
                
                # Check for attacks from X to Y
                for ax in args_X:
                    for ay in args_Y:
                        for contrary in self.contraries:
                            if ax.claim == contrary.contrary_attacker and contrary.contraried_literal in ay.leaves:
                                reverse = any(self.is_preferred(y, x) for y in Y for x in X)
                                if reverse:
                                    self.reverse_attacks.add((frozenset(Y), frozenset(X)))
                                else:
                                    self.normal_attacks.add((frozenset(X), frozenset(Y)))
        
        # Now add the subset attacks: if (ab) attacks c, then (abc) should also attack c
        additional_normal = set()
        additional_reverse = set()
        
        # For normal attacks: if X attacks Y, then any superset of X should attack Y
        for X_att, Y_att in self.normal_attacks:
            X = set(X_att)
            Y = set(Y_att)
            for Z in self.assumption_combinations:
                if X.issubset(Z) and Z != X:
                    additional_normal.add((frozenset(Z), Y_att))
        
        # For reverse attacks: if Y attacks X, then any superset of Y should attack X
        for Y_att, X_att in self.reverse_attacks:
            Y = set(Y_att)
            X = set(X_att)
            for Z in self.assumption_combinations:
                if Y.issubset(Z) and Z != Y:
                    additional_reverse.add((frozenset(Z), X_att))
        
        # Add the additional attacks
        self.normal_attacks.update(additional_normal)
        self.reverse_attacks.update(additional_reverse)


    
    # ------------------------- Visualization -------------------------

    def plot_aba_plus_graph(self, output_html="aba_plus_graph.html"):
        """
        Visualize ABA+ framework with PyVis.
        - Normal attacks: solid black lines
        - Reverse attacks: dashed red lines
        Nodes: labeled with assumption sets
        """
        if not hasattr(self, "normal_attacks") or not hasattr(self, "reverse_attacks"):
            print("Warning: ABA+ attacks not generated. Call make_aba_plus() first.")
            return

        net = Network(directed=True, notebook=False, height="750px", width="100%")
        net.set_options("""
        {
        "physics": {"enabled": true, "stabilization": {"enabled": true, "iterations": 200}}
        }
        """)

        # Add nodes labeled by assumption sets
        for S in self.assumption_combinations:
            label = "{" + ",".join(str(l) for l in sorted(S, key=str)) + "}" if S else "{}"
            net.add_node(str(frozenset(S)), label=label)

        # Normal attacks
        for att in self.normal_attacks:
            net.add_edge(str(att[0]), str(att[1]), color='black', dashes=False, width=2, title="Normal Attack")

        # Reverse attacks
        for att in self.reverse_attacks:
            net.add_edge(str(att[0]), str(att[1]), color='red', dashes=True, width=2, title="Reverse Attack")

        net.write_html(output_html)
        print(f"ABA+ attack graph saved to {output_html}")
        print(f"  - Normal attacks: {len(self.normal_attacks)}")
        print(f"  - Reverse attacks: {len(self.reverse_attacks)}")
