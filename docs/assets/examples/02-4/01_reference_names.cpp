#include <iostream>

int main()
{
    int score = 72;
    int copied = score;
    int& sameScore = score;

    copied = 40;
    sameScore = 85;

    std::cout << score << " " << copied << " " << sameScore << std::endl;

    int other = 60;

    sameScore = other;
    other = 90;

    std::cout << score << " " << other << " " << sameScore << std::endl;
}
