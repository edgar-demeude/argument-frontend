from argument import Argument
from contrary import Contrary
from literal import Literal
from rule import Rule


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
