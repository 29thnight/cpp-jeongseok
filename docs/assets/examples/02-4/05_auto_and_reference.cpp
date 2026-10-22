#include <iostream>
#include <vector>

int main()
{
    std::vector<int> scores{60, 80};
    const std::vector<int>& view = scores;
    auto copy = view;
    const auto& readOnly = view;

    copy[0] = 10;
    scores[1] = 95;

    std::cout << copy[0] << " " << copy[1] << std::endl;
    std::cout << readOnly[0] << " " << readOnly[1] << std::endl;

    for (auto value : scores) {
        value = 0;
        std::cout << value << " ";
    }

    std::cout << std::endl;
    std::cout << scores[0] << " " << scores[1] << std::endl;
}
