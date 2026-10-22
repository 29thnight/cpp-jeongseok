#include <iostream>
#include <string>
#include <vector>

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

std::string makeSummary(int count)
{
    std::string text = "Reached target: ";

    text += std::to_string(count);

    return text;
}

int main()
{
    const std::vector<int> scores{65, 80, 95, 80};

    const int count = countAtLeast(scores, 80);
    std::string summary = makeSummary(count);

    summary += " students";

    std::cout << summary << std::endl;
    std::cout << scores[0] << std::endl;
}
