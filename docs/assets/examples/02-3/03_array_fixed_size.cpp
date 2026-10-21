#include <array>
#include <iostream>

int main()
{
    std::array<int, 3> scores{80, 90, 70};
    std::array<int, 3> zeros{};
    std::array<int, 3> partial{5};
    std::array<int, 0> empty{};

    scores[1] = 95;
    std::cout << "size: " << scores.size() << '\n';
    std::cout << "scores:";
    for (auto score : scores)
    {
        std::cout << ' ' << score;
    }
    std::cout << "\nzeros:";
    for (auto value : zeros)
    {
        std::cout << ' ' << value;
    }
    std::cout << "\npartial:";
    for (auto value : partial)
    {
        std::cout << ' ' << value;
    }
    std::cout << "\nempty size: " << empty.size() << '\n';

    int visits = 0;
    for (auto value : empty)
    {
        std::cout << value << '\n';
        ++visits;
    }
    std::cout << "empty visits: " << visits << '\n';
}
