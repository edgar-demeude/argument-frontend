import re
from typing import List, Tuple, Dict, Set


def _parse_list(content: str) -> List[str]:
    """
    Parse a string representing a list of literals into a Python list of strings.

    Args:
        content (str): A string in the form "[a,b,c]" or "a,b,c".

    Returns:
        List[str]: A list of literal identifiers as strings.

    Examples:
        >>> _parse_list("[a,b,c]")
        ['a', 'b', 'c']
        >>> _parse_list("x,y,z")
        ['x', 'y', 'z']
        >>> _parse_list("[]")
        []
    """
    content = content.strip()
    if content.startswith("[") and content.endswith("]"):
        content = content[1:-1].strip()
    if not content:
        return []
    return [x.strip() for x in content.split(",") if x.strip()]


def _parse_rule_line(line: str) -> Dict[str, Dict[str, Set[str]]]:
    """
    Parse a single rule line of the form [rX]: head <- body.

    Args:
        line (str): Rule string, e.g. "[r1]: p <- q,a".

    Returns:
        Dict[str, Dict[str, Set[str]]]: Mapping of rule ID to {head: set of body literals}.

    Examples:
        >>> _parse_rule_line("[r1]: p <- q,a")
        {'r1': {'p': {'q', 'a'}}}
        >>> _parse_rule_line("[r2]: q <- ")
        {'r2': {'q': set()}}
    """
    match = re.match(r"\[(r\d+)\]:\s*(\w+)\s*<-\s*(.*)", line)
    if match:
        r_id = match.group(1)
        head = match.group(2)
        body = match.group(3).strip()
        body_atoms = set(_parse_list(body)) if body else set()
        return {r_id: {head: body_atoms}}
    return {}


def _parse_pref_line(line: str) -> Tuple[List[str], str, List[str]]:
    """
    Parse a preference line of the form PREF: a,b > c,d, or using < or =.

    Args:
        line (str): Preference string starting with "PREF:".

    Returns:
        Tuple[List[str], str, List[str]]: (left literals, operator, right literals)

    Examples:
        >>> _parse_pref_line("PREF: a,b > c,d")
        (['a', 'b'], '>', ['c', 'd'])
        >>> _parse_pref_line("PREF: x < y,z")
        (['x'], '<', ['y', 'z'])
        >>> _parse_pref_line("PREF: a = b,c")
        (['a'], '=', ['b', 'c'])
    """
    content = line.split(":", 1)[1].strip()
    for op in [">", "<", "="]:
        if op in content:
            left, right = content.split(op, 1)
            return _parse_list(left), op, _parse_list(right)
    return [], "", []


def parse_doc(path: str) -> Tuple[
    List[str],
    List[str],
    List[Tuple[str, str]],
    List[Dict[str, Dict[str, Set[str]]]],
    List[Tuple[List[str], str, List[str]]]
]:
    """
    Parse a structured document containing literals, assumptions, contraries,
    rules, and preferences.

    Args:
        path (str): Path to the text file to parse.

    Returns:
        Tuple containing:
        - language (List[str]): List of all literals in the language.
        - assumptions (List[str]): List of assumed literals.
        - contraries (List[Tuple[str, str]]): List of contrary pairs (literal, contrary).
        - rules (List[Dict[str, Dict[str, Set[str]]]]): List of rules,
          each rule is {rule_id: {head: set of body literals}}.
        - preferences (List[Tuple[List[str], str, List[str]]]): List of preferences,
          each preference is a tuple (left literals, operator, right literals).

    Examples:
        >>> # doc.txt content:
        >>> # L: [a,b,c]
        >>> # A: [a,b]
        >>> # C(a): b
        >>> # [r1]: p <- q,a
        >>> # PREF: a,b > c
        >>> parse_doc("doc.txt")
        (['a','b','c'], ['a','b'], [('a','b')], [{'r1': {'p': {'q','a'}}}], [(['a','b'], '>', ['c'])])
    """
    language: List[str] = []
    assumptions: List[str] = []
    contraries: List[Tuple[str, str]] = []
    rules: List[Dict[str, Dict[str, Set[str]]]] = []
    preferences: List[Tuple[List[str], str, List[str]]] = []

    with open(path, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            if line.startswith("L:"):
                language = _parse_list(line.split(":", 1)[1])
            elif line.startswith("A:"):
                assumptions = _parse_list(line.split(":", 1)[1])
            elif line.startswith("C("):
                match = re.match(r"C\((\w+)\):\s*(\w+)", line)
                if match:
                    contraries.append((match.group(1), match.group(2)))
            elif line.startswith("[r"):
                rule = _parse_rule_line(line)
                if rule:
                    rules.append(rule)
            elif line.startswith("PREF:"):
                pref = _parse_pref_line(line)
                if pref != ([], "", []):
                    preferences.append(pref)

    return language, assumptions, contraries, rules, preferences


if __name__ == "__main__":
    language, assumptions, contraries, rules, preferences = parse_doc("./backend/doc.txt")

    print("Language:", language)
    print("Assumptions:", assumptions)
    print("Contraries:", contraries)
    print("Rules:", rules)
    print("Preferences:", preferences)
    
