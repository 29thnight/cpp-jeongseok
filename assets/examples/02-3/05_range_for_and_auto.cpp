#include <iostream>
#include <string>
#include <vector>

int main()
{
    std::vector<int> scores{80, 90, 70};
    auto count = scores.size();
    auto total = 0;

    for (auto score : scores)
    {
        total += score;
    }
    std::cout << "count: " << count << '\n';
    std::cout << "total: " << total << '\n';

    // In this vector<int> example, score is a separate copied int.
    std::cout << "copies:";
    for (auto score : scores)
    {
        score += 10;
        std::cout << ' ' << score;
    }
    std::cout << "\noriginal:";
    for (auto score : scores)
    {
        std::cout << ' ' << score;
    }
    std::cout << '\n';

    // auto infers from this initializer; it is not a changeable runtime type.
    auto title = std::string{"Quiz"};
    std::cout << "title: " << title << '\n';
}
