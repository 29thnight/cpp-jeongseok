#include <iomanip>
#include <iostream>
#include <vector>

// Preconditions: at most 100 scores, each in [0, 100].
int sumScores(const std::vector<int>& scores);
int countAtLeast(const std::vector<int>& scores, int threshold);

// Additional precondition: scores is not empty.
double averageScore(const std::vector<int>& scores);

int main()
{
    int count = 0;

    std::cout << "Count (0..100):" << std::endl;
    if (!(std::cin >> count)) {
        std::cout << "Input error." << std::endl;
        return 1;
    }

    if (count < 0 || count > 100) {
        std::cout << "Count out of range." << std::endl;
        return 1;
    }

    std::vector<int> scores;

    for (int index = 0; index < count; ++index) {
        int score = 0;

        std::cout << "Score " << index + 1 << " (0..100):" << std::endl;
        if (!(std::cin >> score)) {
            std::cout << "Input error." << std::endl;
            return 1;
        }

        if (score < 0 || score > 100) {
            std::cout << "Score out of range." << std::endl;
            return 1;
        }

        scores.push_back(score);
    }

    std::cout << "Count: " << scores.size() << std::endl;
    std::cout << "Total: " << sumScores(scores) << std::endl;
    std::cout << "At least 80: " << countAtLeast(scores, 80) << std::endl;

    if (scores.empty()) {
        std::cout << "Average: no data" << std::endl;
    } else {
        std::cout << std::fixed << std::setprecision(1);
        std::cout << "Average: " << averageScore(scores) << std::endl;
    }
}

int sumScores(const std::vector<int>& scores)
{
    int total = 0;

    for (int score : scores) {
        total += score;
    }

    return total;
}

int countAtLeast(const std::vector<int>& scores, int threshold)
{
    int count = 0;

    for (int score : scores) {
        if (score >= threshold) {
            ++count;
        }
    }

    return count;
}

double averageScore(const std::vector<int>& scores)
{
    const int total = sumScores(scores);
    const double count = static_cast<double>(scores.size());

    return total / count;
}
