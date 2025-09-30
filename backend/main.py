from aba_builder import build_aba_framework, prepare_aba_plus_framework
from aba_utils import print_aba_plus_results


def main():
    """
    Main function to generate and analyze an ABA+ framework.
    """
    # Build the ABA+ framework
    print("\n" + "="*50)
    print("Building ABA+ Framework")
    print("="*50)
    
    # Load and prepare the framework
    aba_framework = build_aba_framework("./backend/data/example.txt")
    print(f"\n ------- Original ABA framework -------\n{aba_framework}")
    
    # Prepare for ABA+ (make atomic and generate arguments/attacks)
    aba_framework = prepare_aba_plus_framework(aba_framework)
    
    # Generate ABA+ specific components
    print("\n" + "="*50)
    print("Generating ABA+ Components")
    print("="*50)
    aba_framework.make_aba_plus()
    
    # Print results
    print_aba_plus_results(aba_framework)
    
    # Plot the graph
    aba_framework.plot_aba_plus_graph()


if __name__ == "__main__":
    main()