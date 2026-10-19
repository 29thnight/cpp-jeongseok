#include <iostream>

int calculateShelfLength(int boxWidth, int boxCount);

int main()
{
    std::cout << calculateShelfLength(12, 4) << '\n';
}

int calculateShelfLength(int boxWidth, int boxCount)
{
    return boxWidth * boxCount;
}
