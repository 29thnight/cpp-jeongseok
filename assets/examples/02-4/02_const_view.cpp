#include <iostream>
#include <vector>

int sumScores(const std::vector<int>& scores)
{
    int total = 0;

    for (int score : scores) {
        total += score;
    }

    return total;
}

int main()
{
    std::vector<int> scores{40, 70, 90};
    const std::vector<int>& view = scores;

    std::cout << sumScores(view) << std::endl;

    scores[0] = 50;
    std::cout << sumScores(view) << std::endl;

    const std::vector<int> fixedScores{80, 100};

    std::cout << sumScores(fixedScores) << std::endl;
}
