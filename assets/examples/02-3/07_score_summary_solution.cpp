#include <iostream>
#include <vector>

bool is_passing(int score)
{
    return score >= 60;
}

int main()
{
    std::vector<int> scores{55, 80, 60, 95};
    scores.push_back(40);

    int total = 0;
    int passing = 0;
    for (auto score : scores)
    {
        total += score;
        if (is_passing(score))
        {
            ++passing;
        }
    }

    std::cout << "count: " << scores.size() << '\n';
    std::cout << "total: " << total << '\n';
    std::cout << "passing: " << passing << '\n';
}
