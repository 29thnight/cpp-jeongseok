#include <iostream>

int twice(int value)
{
    return value * 2;
}

int main()
{
    int doubled = twice(7);
    int nextValue = doubled + 1;

    std::cout << doubled << '\n';
    std::cout << nextValue << '\n';
}
