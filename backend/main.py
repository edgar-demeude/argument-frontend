from typing import Dict, Set
from argument import Argument
from parsing import parse_doc
from contrary import Contrary
from literal import Literal
from rule import Rule
from aba_framework import ABAFramework


def build_aba_framework(doc_path: str) -> ABAFramework:
    """
    Build an ABAFramework object from a structured document.

    Args:
        doc_path (str): Path to the document to parse.

    Returns:
        ABAFramework: An ABAFramework instance containing:
            - language (Set[Literal]): Set of Literal objects.
            - rules (Set[Rule]): Set of Rule objects.
            - assumptions (Set[Literal]): Set of assumptions.
            - contraries (Set[Contrary]): Set of contraries.

    Example:
        >>> aba = build_aba_framework("./backend/doc.txt")
        >>> isinstance(next(iter(aba.language)), Literal)
        True
        >>> isinstance(next(iter(aba.rules)), Rule)
        True
    """
    # Parse the document
    language_parse, assumptions_parse, contraries_parse, rules_parse, preferences_parse = parse_doc(doc_path)

    # Initialize containers
    language: Dict[str, Literal] = {}
    rules: Set[Rule] = set()
    contraries: Set[Contrary] = set()
    assumptions: Set[Literal] = set()

    # Language: build Literal objects
    for lit in language_parse:
        language[lit] = Literal(lit)
    language_set: Set[Literal] = set(language.values())

    # Rules: convert parsed structure into Rule objects
    for rule in rules_parse:
        r_id = next(iter(rule))                 
        head = next(iter(rule[r_id]))           
        body_atoms = rule[r_id][head]           
        body_literals = {language[i] for i in body_atoms if i in language}
        rules.add(Rule(r_id, language[head], body_literals))

    # Contraries: build Contrary objects
    for lit1, lit2 in contraries_parse:
        contraries.add(Contrary(language[lit1], language[lit2]))

    # Assumptions: convert to set of Literal
    for lit in assumptions_parse:
        assumptions.add(language[lit])

    # Build ABA framework
    aba_framework = ABAFramework(
        language=language_set,
        rules=rules,
        assumptions=assumptions,
        contraries=contraries
    )

    return aba_framework


def main():
    """
    Main function to build the ABA framework, generate arguments and attacks,
    and check atomicity.
    """
    # Build the framework
    aba_framework = build_aba_framework("./backend/atomic.txt")
    print(f"\n ------- ABA framework -------\n {aba_framework}")


    aba_framework.transform_aba()
    print(aba_framework)

    # Generate arguments
    aba_framework.generate_arguments()
    gen_args = aba_framework.arguments
    print("\n ------- Generated arguments -------\n ")
    print(gen_args)

    # Generate attacks
    aba_framework.generate_attacks()
    attacks = aba_framework.attacks
    print("\n ------- Generated attacks -------\n ")
    print(attacks, "\n")

    aba_framework.plot_attack_graph()


if __name__ == "__main__":
    main()
