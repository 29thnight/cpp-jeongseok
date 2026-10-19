#include <iostream>

int calculateCardArea(int sideLength, int cardCount)
{
    int oneCardArea = sideLength * sideLength;
    int totalArea = oneCardArea * cardCount;
    return totalArea;
}

int main()
{
    int smallCardArea = calculateCardArea(6, 4);
    int largeCardArea = calculateCardArea(8, 3);
    int combinedArea = smallCardArea + largeCardArea;

    std::cout << "Small cards: " << smallCardArea << '\n';
    std::cout << "Large cards: " << largeCardArea << '\n';
    std::cout << "Combined area: " << combinedArea << '\n';
}
