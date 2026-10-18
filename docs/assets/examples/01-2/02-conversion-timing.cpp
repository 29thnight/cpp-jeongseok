#include <iostream>

int main()
{
    int total{7};
    int count{2};
    double storedAfter = total / count;
    double convertedAfter = static_cast<double>(total / count);
    double convertedBefore = static_cast<double>(total) / count;

    std::cout << storedAfter << std::endl;
    std::cout << convertedAfter << std::endl;
    std::cout << convertedBefore << std::endl;
    std::cout << 7.0 / 2 << std::endl;
}
