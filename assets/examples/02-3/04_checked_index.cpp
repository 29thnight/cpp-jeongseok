#include <cstddef>
#include <iostream>
#include <iterator>
#include <vector>

int main()
{
    std::vector<int> scores{80, 90, 70};
    int index = 0;

    // Enter one integer. Input failure is not a valid index.
    if (!(std::cin >> index))
    {
        std::cout << "invalid input\n";
        return 0;
    }

    // ssize supplies a signed count. Check BOTH ends before conversion.
    if (index < 0 || index >= std::ssize(scores))
    {
        std::cout << "out of range\n";
        return 0;
    }

    auto position = static_cast<std::size_t>(index);
    std::cout << "score: " << scores[position] << '\n';
}
