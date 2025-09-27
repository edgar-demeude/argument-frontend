from argument import Argument
from contrary import Contrary
from literal import Literal
from rule import Rule
from attacks import Attacks
from collections import deque, defaultdict
from itertools import product


class ABAFramework:
    """
    Represents an Assumption-Based Argumentation (ABA) framework.

    Attributes:
        language (set[Literal]): The set of all literals in the framework.
        rules (set[Rule]): The set of all rules in the framework.
        assumptions (set[Literal]): The set of all assumptions in the framework.
        contraries (set[Contrary]): The set of all contrary relationships in the framework.
        preferences (dict[Literal, set[Literal]]): A mapping of literals to their preferred literals.
        arguments (set[Argument]): The set of all arguments in the framework.
    """

    def __init__(self, language: set[Literal], rules: set[Rule], assumptions: set[Literal], contraries: set[Contrary], preferences: dict[Literal, set[Literal]] = None):
        self.language: set[Literal] = language
        self.rules: set[Rule] = rules
        self.assumptions: set[Literal] = assumptions
        self.contraries: set[Contrary] = contraries
        self.preferences: dict[Literal, set[Literal]
                               ] = preferences if preferences is not None else {}
        self.arguments: set[Argument] = set()
        self.attacks: set[Attacks] = set()

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
        Returns a string representation of the ABAFramework, including its language, rules, assumptions, contraries, preferences, and arguments.
        """
         
        language_str = ', '.join(str(literal) for literal in self.language)
        rules_str = '\n'.join(str(rule) for rule in self.rules)
        assumptions_str = ', '.join(str(literal)
                                    for literal in self.assumptions)
        contraries_str = ', '.join(str(contrary)
                                   for contrary in self.contraries)
        preferences_str = '\n'.join(f"{str(literal)}: {', '.join(str(pref) for pref in prefs)}"
                                    for literal, prefs in self.preferences.items())
        arguments_str = '\n'.join(str(argument)
                                  for argument in self.arguments)
        return (f"L = {{{language_str}}}\n"
                f"R = {{\n{rules_str}\n}}\n"
                f"A = {{{assumptions_str}}}\n"
                f"CONTRARIES = {{{contraries_str}}}\n"
                f"PREF :\n{preferences_str}\n"
                f"ARGS :\n{arguments_str}\n")

    def __hash__(self) -> int:
        """
        Returns a hash value for the ABAFramework, allowing it to be used in sets and as dictionary keys.
        """

        return hash((frozenset(self.language), frozenset(self.rules), frozenset(self.assumptions), frozenset(self.contraries)))

    def generate_arguments(self) -> None:
        """
        Generates all possible arguments in the ABA framework based on the rules, assumptions, and contraries.

        This method populates the self.arguments set with all arguments that can be constructed from the framework.
        """
        arg_count = 1
        arguments_by_claim = defaultdict(set)
        queue = deque()

        # Assumptions : {a} ⊢ a
        for a in self.assumptions:
            arg = Argument(f"A{arg_count}", a, {a})
            arguments_by_claim[a].add(arg)
            queue.append(arg)
            arg_count += 1

        # Empty body : {} ⊢ head
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
                    new_arg = Argument(
                        f"A{arg_count}", rule.head, new_leaves)

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
    
    def make_aba_atomic(self) -> None:
        # TODO: Transform the ABA framework to an atomic one if it is non-atomic
        # and non-circular, following the procedure described in Lecture 4A.5:
        # "Transforming non-circular ABA frameworks to Atomic ABA frameworks"
        # Reference: https://bruno-yun.notion.site/Lecture-4A-Assumption-based-argumentation-and-complexity-1-5-hours-5291ad4e5eb44db182980fc0728f5faf

        raise NotImplementedError("make_aba_atomic is not implemented yet")

    def is_aba_circular(self) -> bool:
        # TODO: Checks if the ABA framework is circular.

        """
        Checks if the ABA framework is circular.

        An argument is said to be circular iff there is a path from a leaf to the root with two distinct 
        vertices with the same label. An ABA framework is said to be circular if there is at least one 

        Returns:
            bool: True if the framework is circular, False otherwise.
        circular argument.
        """

        raise NotImplementedError("make_aba_atomic is not implemented yet")
        

    
    def make_aba_circular(self) -> None:
        """
        Transforms the ABA framework to a non-circular one by renaming heads and bodies of rules.

        Circular arguments occur when there is a path from a leaf to a root where the same literal appears more than once.
        This method eliminates circularity by systematically renaming rule heads and bodies.

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
        The function **modifies the ABAFramework in-place** and does not return any value.

        Example:
            # Original framework:
            # Language: {a, b, x, y}
            # Assumptions: {a, b}
            # Rules:
            #   r1: y <- y
            #   r2: x <- x
            #   r3: x <- a
            #
            # After make_aba_circular():
            #   New rules:
            #       y  <- y1
            #       x  <-  x1
            #       x1 <- a  
            #       x  <- a  
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

