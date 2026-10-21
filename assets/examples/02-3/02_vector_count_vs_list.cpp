#include <iostream>
#include <vector>

int main()
{
    std::vector<int> one_value{3};
    std::vector<int> three_zeros(3);
    std::vector<int> two_values{3, 7};
    std::vector<int> three_sevens(3, 7);

    std::cout << "{3}:";
    for (auto value : one_value)
    {
        std::cout << ' ' << value;
    }
    std::cout << "\n(3):";
    for (auto value : three_zeros)
    {
        std::cout << ' ' << value;
    }
    std::cout << "\n{3, 7}:";
    for (auto value : two_values)
    {
        std::cout << ' ' << value;
    }
    std::cout << "\n(3, 7):";
    for (auto value : three_sevens)
    {
        std::cout << ' ' << value;
    }
    std::cout << '\n';
}
