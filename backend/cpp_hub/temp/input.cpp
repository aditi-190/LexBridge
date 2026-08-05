#include <iostream>
using namespace std;

int add(int a, int b)
{
    return a + b;
}

int main()
{
    int x;
    int y;
    int result;

    x = 10;
    y = 20;

    result = add(x, y);

    if (result > 20)
    {
        cout << "Greater" << endl;
    }
    else
    {
        cout << "Smaller" << endl;
    }

    cout << result << endl;

    return 0;
}