from argument import Argument
from contrary import Contrary
from literal import Literal
from rule import Rule
from attacks import Attacks
from collections import deque, defaultdict
from itertools import product, combinations
from pyvis.network import Network


class ABAFramework:
    """
    Represents an Assumption-Based Argumentation (ABA) framework.

    Attributes:
        language (set[Literal]): The set of all literals in the framework.
        rules (set[Rule]): The set of all rules in the framework.
        assumptions (set[Literal]): The set of all assumptions in the framework.
        contraries (set[Contrary]): The set of all contrary relationships in the framework.
        preferences (dict[Literal, set[Literal]]): A mapping of literals to their less preferred literals.
        arguments (set[Argument]): The set of all arguments in the framework.
        attacks (set[Attacks]): The set of all standard attacks in the framework.
        normal_attacks (set[Attacks]): The set of normal attacks in ABA+ (not defeated by preferences).
        reverse_attacks (set[Attacks]): The set of reverse attacks in ABA+ (reversed due to preferences).
        assumption_combinations (list[set[Literal]]): All possible subsets of assumptions.
    """

    def __init__(self, language: set[Literal], rules: set[Rule], assumptions: set[Literal], contraries: set[Contrary], preferences: dict[Literal, set[Literal]] = None):
        self.language: set[Literal] = language
        self.rules: set[Rule] = rules
        self.assumptions: set[Literal] = assumptions
        self.base_assumptions: set[Literal] = assumptions
        self.contraries: set[Contrary] = contraries
        self.preferences: dict[Literal, set[Literal]] = preferences if preferences is not None else {}
        self.arguments: set[Argument] = set()
        self.attacks: set[Attacks] = set()
        self.normal_attacks: set[Attacks] = set()
        self.reverse_attacks: set[Attacks] = set()
        self.assumption_combinations: list[set[Literal]] = []

    def __eq__(self, other: object) -> bool:
        """
        Checks equality between two ABAFramework objects.
        """
        if not isinstance(other, ABAFramework):
            return False
        return (
            self.language == other.language
            and self.rules == other.rules
            and self.assumptions == other.assumptions
            and self.contraries == other.contraries
        )

    def __str__(self) -> str:
        """
        Returns a string representation of the ABAFramework, including its language, rules, assumptions, contraries,
        and, if present, preferences and arguments.
        """
        language_str = ', '.join(str(literal) for literal in sorted(self.language, key=str))
        rules_str = '\n'.join(str(rule) for rule in sorted(self.rules, key=str))
        assumptions_str = ', '.join(str(literal) for literal in sorted(self.assumptions, key=str))
        contraries_str = ', '.join(str(contrary) for contrary in sorted(self.contraries, key=str))

        result = [
            f"L = {{{language_str}}}",
            f"R = {{\n{rules_str}\n}}",
            f"A = {{{assumptions_str}}}",
            f"CONTRARIES = {{{contraries_str}}}"
        ]

        if self.preferences:
            # Sort for consistent output
            sorted_prefs = sorted(self.preferences.items(), key=lambda x: str(x[0]))
            preferences_str = '\n'.join(
                f"  {str(literal)} > {{{', '.join(str(p) for p in sorted(prefs, key=str))}}}"
                for literal, prefs in sorted_prefs
            )
            result.append(f"PREFERENCES:\n{preferences_str}")

        if self.arguments:
            arguments_str = '\n'.join(str(argument) for argument in sorted(self.arguments, key=str))
            result.append(f"ARGS:\n{arguments_str}")

        return '\n'.join(result)

    def __hash__(self) -> int:
        """
        Returns a hash value for the ABAFramework, allowing it to be used in sets and as dictionary keys.
        """
        return hash((frozenset(self.language), frozenset(self.rules), frozenset(self.assumptions), frozenset(self.contraries)))

    def is_preferred(self, lit1: Literal, lit2: Literal) -> bool:
        """
        Check if lit1 is preferred over lit2 according to the preference relation.
        
        Args:
            lit1: The first literal
            lit2: The second literal
            
        Returns:
            bool: True if lit1 > lit2 (lit1 is preferred over lit2), False otherwise
        """
        return lit1 in self.preferences and lit2 in self.preferences[lit1]

    def generate_arguments(self) -> None:
        """
        Generates all possible arguments in the ABA framework based on the rules, assumptions, and contraries.

        This method populates the self.arguments set with all arguments that can be constructed from the framework.
        """
        arg_count = 1
        arguments_by_claim = defaultdict(set)
        queue = deque()

        # Assumptions: {a} ⊢ a
        for a in self.assumptions:
            arg = Argument(f"A{arg_count}", a, {a})
            arguments_by_claim[a].add(arg)
            queue.append(arg)
            arg_count += 1

        # Empty body: {} ⊢ head
        for rule in self.rules:
            if not rule.body:
                arg = Argument(f"A{arg_count}", rule.head, set())
                arguments_by_claim[rule.head].add(arg)
                queue.append(arg)
                arg_count += 1

        # Queue processing to generate more arguments
        while queue:
            current_arg = queue.popleft()
            current_claim = current_arg.claim

            for rule in self.rules:
                if current_claim not in rule.body:
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

        # Collect all generated arguments
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
        """
        # Build adjacency list: for each literal, store the set of literals it can reach via rules
        adj = {lit: set() for lit in self.language}
        for rule in self.rules:
            for body_lit in rule.body:
                adj[body_lit].add(rule.head)

        def has_cycle(lit, visited, stack):
            """Helper function to perform DFS and detect cycles."""
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
        """
        k = len(self.language) - len(self.assumptions)
        new_language = set(self.language)
        new_rules = set()

        for rule in self.rules:
            if not rule.body or all(lit in self.assumptions for lit in rule.body):
                # Atomic rule: create x1, x2, ..., x(k-1)
                for i in range(1, k):
                    new_head = Literal(f"{rule.head}{i}")
                    new_body = set(rule.body)
                    new_language.add(new_head)
                    new_rule_name = f"{rule.rule_name}_{i+1}"
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

    def plot_attack_graph(self, output_html="attack_graph.html"):
        """
        Generates a directed graph from the attacks in the ABA framework and plots it using pyvis.

        Args:
            output_html(str): The filename for the output HTML visualization.
        """
        # Ensure attacks are generated
        if not hasattr(self, "attacks") or not self.attacks:
            self.generate_attacks()

        net = Network(directed=True, notebook=False)

        def clean_label(arg):
            """Extracts only the argument ID (e.g., A1, A2) from the string representation."""
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


    def _generate_assumption_combinations(self) -> list[set[Literal]]:
        """
        Generates all possible combinations of assumptions in the ABA framework.

        Returns:
            list[set[Literal]]: A list containing every subset of the assumptions, 
            including the empty set.
        """
        assumptions_list = list(self.base_assumptions)
        all_combos: list[set[Literal]] = []

        for r in range(len(assumptions_list) + 1):
            for combo in combinations(assumptions_list, r):
                all_combos.append(set(combo))

        return all_combos


    
    def generate_normal_reverse_attacks(self) -> None:
        """
        Generates normal and reverse attacks for ABA+ framework with preferences.
        
        For each potential attack from arg1 to arg2:
        - Normal attack: arg1 attacks arg2 if no preference reversal applies.
        - Reverse attack: arg2 attacks arg1 if there exists y in arg2.leaves
        and x in arg1.leaves such that y is strictly preferred over x.
        """
        self.normal_attacks.clear()
        self.reverse_attacks.clear()
        
        for arg1 in self.arguments:
            print("\n\n\n------------",arg1)
            for arg2 in self.arguments:
                for contrary in self.contraries:
                    if arg1.claim == contrary.contrary_attacker and contrary.contraried_literal in arg2.leaves:

                        # By default assume it's a normal attack
                        is_normal = True  

                        # If SOME y in target is strictly preferred over SOME x in attacker -> reverse
                        if any(
                            self.is_preferred(y, x)
                            for y in arg2.leaves
                            for x in arg1.leaves
                        ):
                            self.reverse_attacks.add(Attacks(arg2, arg1))
                            is_normal = False

                        if is_normal:
                            self.normal_attacks.add(Attacks(arg1, arg2))

    def make_aba_plus(self) -> None:
        """
        Transforms the ABA framework into an ABA+ framework by:
        1. Generating all assumption combinations
        2. Generating normal and reverse attacks based on preferences
        
        This method populates:
        - self.assumption_combinations: All possible subsets of assumptions
        - self.normal_attacks: Attacks that are not defeated by preferences
        - self.reverse_attacks: Attacks that are reversed due to preferences
        """
        print("\n ------- Generating ABA+ Framework -------\n")
        
        # Generate all assumption combinations
        self.assumption_combinations = self._generate_assumption_combinations()
        print(f"Generated {len(self.assumption_combinations)} assumption combinations")
        
        # Generate normal and reverse attacks based on preferences
        self.generate_normal_reverse_attacks()
        print(f"Generated {len(self.normal_attacks)} normal attacks")
        print(f"Generated {len(self.reverse_attacks)} reverse attacks")
        
        print("\n ------- ABA+ Framework Ready -------\n")

    
    def plot_aba_plus_graph(self, output_html="aba_plus_graph.html"):
        """
        Generates a directed graph for the ABA+ framework with preferences.
        Normal attacks are shown as solid lines, reverse attacks as dashed lines.
        Nodes are labeled with their assumption sets (leaves).

        Args:
            output_html(str): The filename for the output HTML visualization.
        """
        # Ensure normal and reverse attacks are generated
        if not hasattr(self, "normal_attacks") or not hasattr(self, "reverse_attacks"):
            print("Warning: ABA+ attacks not generated. Call make_aba_plus() first.")
            return

        net = Network(directed=True, notebook=False, height="750px", width="100%")
        
        # Configure physics for better layout
        net.set_options("""
        {
        "physics": {
            "enabled": true,
            "stabilization": {
            "enabled": true,
            "iterations": 200
            }
        }
        }
        """)

        def get_arg_id(arg):
            """Extracts the argument ID (e.g., A1, A2) from the string representation."""
            raw = str(arg)
            if raw.startswith("[") and "]" in raw:
                return raw[1:raw.index("]")]
            return raw
        
        def get_leaves_label(arg):
            """Creates a label from the argument's leaves (assumptions)."""
            if not arg.leaves:
                return "{}"
            # Sort leaves by their string representation for consistent ordering
            sorted_leaves = sorted(arg.leaves, key=str)
            leaves_str = ",".join(str(leaf) for leaf in sorted_leaves)
            return f"{{{leaves_str}}}"  # Wrap in braces for set notation

        # Add nodes with leaves as labels and full info in tooltip
        for arg in self.arguments:
            node_id = get_arg_id(arg)
            leaves_label = get_leaves_label(arg)
            # Use full argument string as tooltip for additional info
            net.add_node(node_id, label=leaves_label, title=str(arg))

        # Add normal attacks as solid edges
        for attack in self.normal_attacks:
            attacker = get_arg_id(attack.attacker)
            target = get_arg_id(attack.target)
            net.add_edge(attacker, target, 
                        title="Normal Attack",
                        color={'color': 'black'},
                        dashes=False,
                        width=2)

        # Add reverse attacks as dashed edges
        for attack in self.reverse_attacks:
            attacker = get_arg_id(attack.attacker)
            target = get_arg_id(attack.target)
            net.add_edge(attacker, target,
                        title="Reverse Attack (due to preferences)",
                        color={'color': 'red'},
                        dashes=True,
                        width=2)

        net.write_html(output_html)
        print(f"ABA+ attack graph saved to {output_html}")
        print(f"  - Normal attacks (solid black lines): {len(self.normal_attacks)}")
        print(f"  - Reverse attacks (dashed red lines): {len(self.reverse_attacks)}")

