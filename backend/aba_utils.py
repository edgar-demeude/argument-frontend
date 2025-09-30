from argument import Argument


def format_argument_leaves(arg: Argument) -> str:
    """
    Format an argument's leaves as a comma-separated string.
    
    Args:
        arg: The argument to format
        
    Returns:
        str: Formatted string like "a,b,c" or "{}" for empty leaves
    """
    if not arg.leaves:
        return "{}"
    sorted_leaves = sorted(arg.leaves, key=str)
    return ",".join(str(leaf) for leaf in sorted_leaves)


def format_attack(attack) -> str:
    """
    Format an attack showing the assumption sets instead of argument IDs.
    
    Args:
        attack: The attack object
        
    Returns:
        str: Formatted string like "{a,b} attacks {c,d}"
    """
    attacker_leaves = format_argument_leaves(attack.attacker)
    target_leaves = format_argument_leaves(attack.target)
    return f"{{{attacker_leaves}}} attacks {{{target_leaves}}}"


def print_aba_plus_results(aba_framework):
    """
    Print ABA+ framework results including assumption combinations,
    normal attacks, and reverse attacks.
    
    Args:
        aba_framework: The ABA framework with ABA+ generated
    """
    print("\n ------- Assumption Combinations -------")
    print(f"Total combinations: {len(aba_framework.assumption_combinations)}")
    for i, combo in enumerate(aba_framework.assumption_combinations[:10], 1):
        combo_str = '{' + ', '.join(str(lit) for lit in sorted(combo, key=str)) + '}' if combo else '{}'
        print(f"  {i}. {combo_str}")
    if len(aba_framework.assumption_combinations) > 10:
        print(f"  ... and {len(aba_framework.assumption_combinations) - 10} more")
    
    print("\n ------- Normal Attacks (by assumption sets) -------")
    # Sort by attacker and target leaves for readability
    sorted_normal = sorted(aba_framework.normal_attacks, 
                          key=lambda a: (format_argument_leaves(a.attacker), 
                                       format_argument_leaves(a.target)))
    for attack in sorted_normal[:10]:
        print(f"  {format_attack(attack)}")
    if len(aba_framework.normal_attacks) > 10:
        print(f"  ... and {len(aba_framework.normal_attacks) - 10} more")
    
    print("\n ------- Reverse Attacks (by assumption sets) -------")
    sorted_reverse = sorted(aba_framework.reverse_attacks,
                           key=lambda a: (format_argument_leaves(a.attacker),
                                        format_argument_leaves(a.target)))
    for attack in sorted_reverse[:10]:
        print(f"  {format_attack(attack)}")
    if len(aba_framework.reverse_attacks) > 10:
        print(f"  ... and {len(aba_framework.reverse_attacks) - 10} more")
    
    # Verify all arguments only contain assumptions
    print("\n ------- Verification -------")
    non_assumption_args = [arg for arg in aba_framework.arguments 
                           if not all(leaf in aba_framework.assumptions for leaf in arg.leaves)]
    if non_assumption_args:
        print(f"WARNING: Found {len(non_assumption_args)} arguments with non-assumptions!")
        for arg in non_assumption_args[:5]:
            leaves_str = format_argument_leaves(arg)
            print(f"  {{{leaves_str}}} - contains non-assumptions: {arg.leaves - aba_framework.assumptions}")
    else:
        print("✓ All arguments contain only assumptions (framework is atomic)")