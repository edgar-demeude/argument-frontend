"""
Main entry point for generating and analyzing an ABA+ framework.

This script:
  1. Builds an ABA framework from a text specification.
  2. Prints the original (classical) ABA framework.
  3. Prepares the framework for ABA+ (atomic transformation + argument/attack generation).
  4. Generates ABA+ components (assumption combinations, normal/reverse attacks).
  5. Prints the resulting ABA+ framework components.
  6. Plots the ABA+ attack graph between sets of assumptions.
"""

from aba_builder import build_aba_framework, prepare_aba_plus_framework
from aba_utils import print_aba_plus_results


def main():
    """
    Main function to generate and analyze an ABA+ framework.
    """
    # === Step 1: Build the ABA framework from input file ===
    print("\n" + "=" * 50)
    print("Building ABA+ Framework")
    print("=" * 50)

    # Build framework from the given input specification file
    aba_framework = build_aba_framework("./backend/data/simple_plus2.txt")

    # Print the original (non-atomic) ABA framework
    print(f"\n ------- Original ABA framework -------\n{aba_framework}")

    # === Step 2: Prepare the framework for ABA+ ===
    # This includes:
    #  - saving the base assumptions (before atomicity transformation)
    #  - transforming the framework to its atomic version
    #  - generating arguments and standard attacks
    aba_framework = prepare_aba_plus_framework(aba_framework)

    # === Step 3: Generate ABA+ components ===
    print("\n" + "=" * 50)
    print("Generating ABA+ Components")
    print("=" * 50)

    # Generate:
    #  - all combinations of base assumptions
    #  - normal attacks (between assumption sets)
    #  - reverse attacks (between assumption sets)
    aba_framework.make_aba_plus()

    # === Step 4: Print ABA+ results ===
    print_aba_plus_results(aba_framework)

    # === Step 5: Plot ABA+ graph (nodes = assumption sets) ===
    aba_framework.plot_aba_plus_graph()


if __name__ == "__main__":
    main()
