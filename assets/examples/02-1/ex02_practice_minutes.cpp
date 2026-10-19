#include <iostream>

int calculatePracticeMinutes(int roundCount, int minutesPerRound)
{
    return roundCount * minutesPerRound;
}

int main()
{
    int firstPlan = calculatePracticeMinutes(5, 8);
    int secondPlan = calculatePracticeMinutes(3, 6);

    std::cout << firstPlan << '\n';
    std::cout << secondPlan << '\n';
}
