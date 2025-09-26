from argument import Argument
from contrary import Contrary
from literal import Literal
from rule import Rule
from aba_framework import ABAFramework


def main():
    a = Literal("a", False)
    b = Literal("b", False)
    c = Literal("c", False)
    p = Literal("p", False)
    q = Literal("q", False)
    r = Literal("r", False)
    s = Literal("s", False)
    t = Literal("t", False)
    # Literal print test
    print(f"Literal a is: {a}, Literal b is: {b}")

    # Rule print test
    rule1 = Rule("r1", p, {q, a})
    print(f"Rule is: {rule1}")

    # Contrary print test
    contrary1 = Contrary(a, r)
    print(f"Contrary is: {contrary1}")

    # Argument print test
    arg1 = Argument(
        argument_name="A1",
        claim=p,
        leaves={a, b, c}
    )
    print(f"Argument is: {arg1}")

    # language {a,b,c,p,q,r,s,t}
    language = {a, b, c, p, q, r, s, t}

    # rules {p←q,a, q←r, r←b,c}
    rules = {rule1,
             Rule("r2", q, {r}),
             Rule("r3", r, {b, c})}

    # assumptions {a,b,c}
    assumptions = {a, b, c}

    # contraries {a̅ = r, b̅ = s, c̅ = t}
    contraries = {Contrary(a, r),
                  Contrary(b, s),
                  Contrary(c, t)}

    # Create ABA framework
    aba_framework = ABAFramework(
        language=language,
        rules=rules,
        assumptions=assumptions,
        contraries=contraries
    )

    print(f"The ABA framework is: {aba_framework}")


if __name__ == "__main__":
    main()
