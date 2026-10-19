#include <iostream>

int calculateCardArea(int sideLength, int cardCount);
void printTotalArea(int totalArea);

int main()
{
    int totalArea = calculateCardArea(6, 4);
    printTotalArea(totalArea);
}

int calculateCardArea(int sideLength, int cardCount)
{
    return sideLength * sideLength * cardCount;
}

void printTotalArea(int totalArea)
{
    std::cout << "Total area: " << totalArea << '\n';
}
