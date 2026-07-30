# LexBridge Java Grammar

## Program

```
Program → Statement*
```

---

## Statement

```
Statement →
      VariableDeclaration
    | Assignment
    | FunctionDeclaration
    | FunctionCall
    | IfStatement
    | WhileStatement
    | ForStatement
    | ReturnStatement
    | PrintStatement
```

---

## Variable Declaration

```
VariableDeclaration →
Type IDENTIFIER ;
```

Example:

```
int x;
float pi;
string name;
```

---

## Variable Initialization

```
VariableDeclaration →
Type IDENTIFIER = Expression ;
```

Example:

```
int x = 10;
float pi = 3.14;
```

---

## Assignment

```
Assignment →
IDENTIFIER = Expression ;
```

Example:

```
x = 20;
```

---

## Function Declaration

```
FunctionDeclaration →

Type IDENTIFIER
(
ParameterList
)
Block
```

Example:

```
int add(int a, int b){
    return a+b;
}
```

---

## Parameter List

```
ParameterList →

ε

or

Type IDENTIFIER
(
,
Type IDENTIFIER
)*
```

---

## Function Call

```
FunctionCall →

IDENTIFIER
(
ArgumentList
)
;
```

Example

```
add(5,10);
```

---

## Argument List

```
ArgumentList →

ε

or

Expression
(
,
Expression
)*
```

---

## If Statement

```
IfStatement →

if
(
Expression
)
Block

else
Block
```

---

## While Statement

```
WhileStatement →

while
(
Expression
)
Block
```

---

## For Statement

```
ForStatement →

for
(
Assignment
Expression
;
Assignment
)
Block
```

---

## Return Statement

```
ReturnStatement →

return Expression ;
```

---

## Print Statement

```
PrintStatement →

print
(
Expression
)
;
```

---

## Expression

```
Expression →

Term

Expression + Term

Expression - Term
```

---

## Term

```
Term →

Factor

Term * Factor

Term / Factor
```

---

## Factor

```
Factor →

INTEGER

FLOAT

STRING

BOOLEAN

IDENTIFIER

FunctionCall

(
Expression
)
```