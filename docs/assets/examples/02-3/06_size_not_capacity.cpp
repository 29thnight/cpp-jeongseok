#include <iostream>
#include <vector>

int main()
{
    std::vector<int> scores{};
    scores.reserve(8);

    std::cout << "after reserve, size: " << scores.size() << '\n';
    std::cout << "capacity >= 8: " << (scores.capacity() >= 8) << '\n';

    // No element exists yet. Do not read or write scores[0].
    scores.push_back(42);
    std::cout << "after push_back, size: " << scores.size() << '\n';
    std::cout << "first: " << scores[0] << '\n';
}
