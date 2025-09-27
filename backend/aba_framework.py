from argument import Argument
from contrary import Contrary
from literal import Literal
from rule import Rule
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

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, ABAFramework):
            return False
        return (
            self.language == other.language
            and self.rules == other.rules
            and self.assumptions == other.assumptions
            and self.contraries == other.contraries
        )

    def __str__(self) -> str:
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
        return hash((frozenset(self.language), frozenset(self.rules), frozenset(self.assumptions), frozenset(self.contraries)))

    def generate_arguments(self) -> set[Argument]:
        """
        Generates all possible arguments in the ABA framework based on the rules, assumptions, and contraries.
        """
        arg_count = 1
        arguments_by_claim = defaultdict(set)
        queue = deque()

        # Assumptions : {a} ⊢ a
        for a in self.assumptions:
            arg = Argument(f"a{arg_count}", a, {a})
            arguments_by_claim[a].add(arg)
            queue.append(arg)
            arg_count += 1

        # Empty body : {} ⊢ head
        for rule in self.rules:
            if not rule.body:
                arg = Argument(f"a{arg_count}", rule.head, set())
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
                        f"a{arg_count}", rule.head, new_leaves)

                    if new_arg not in arguments_by_claim[rule.head]:
                        arguments_by_claim[rule.head].add(new_arg)
                        queue.append(new_arg)
                        arg_count += 1

        # Collect all generated arguments
        self.arguments = set().union(*arguments_by_claim.values())

    def generate_attacks(self) -> set[tuple[Argument, Argument]]:
        """
        Generates all possible attacks between arguments based on the contraries in the ABA framework.
        """
        attacks: set[tuple[Argument, Argument]] = set()
        for arg1 in self.arguments:
            for arg2 in self.arguments:
                for contrary in self.contraries:
                    if arg1.claim == contrary.contrary_attacker and contrary.contraried_literal in arg2.leaves:
                        attacks.add((arg1, arg2))
        return attacks
