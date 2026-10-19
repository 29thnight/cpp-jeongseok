#include <iostream>

int calculateCardArea(int sideLength, int cardCount)
{
    return sideLength * sideLength * cardCount;
}

void printLayout(int sideLength, int cardCount, int totalArea)
{
    std::cout << "Side length: " << sideLength << '\n';
    std::cout << "Card count: " << cardCount << '\n';
    std::cout << "Total area: " << totalArea << '\n';
}

int main()
{
    int sideLength = 0;
    int cardCount = 0;

    if (!(std::cin >> sideLength >> cardCount))
    {
        std::cout << "Enter two integers.\n";
        return 1;
    }

    if (sideLength < 1 || sideLength > 30 ||
        cardCount < 1 || cardCount > 20)
    {
        std::cout << "Allowed ranges: side 1-30, count 1-20.\n";
        return 1;
    }

    int totalArea = calculateCardArea(sideLength, cardCount);
    printLayout(sideLength, cardCount, totalArea);
}
