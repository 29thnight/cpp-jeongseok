#include <iostream>

int calculateFrameWidth(int width)
{
    int margin = 2;
    return width + margin * 2;
}

int main()
{
    int frameWidth = calculateFrameWidth(10);
    std::cout << frameWidth << '\n';
}
