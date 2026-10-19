#include <iostream>

int addOne(int number)
{
    number = number + 1;
    return number;
}

int main()
{
    int number = 7;
    int nextNumber = addOne(number);

    std::cout << "Original: " << number << '\n';
    std::cout << "Returned: " << nextNumber << '\n';
}
