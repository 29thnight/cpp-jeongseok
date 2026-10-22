#include <vector>

void replaceFirst(const std::vector<int>& scores)
{
    scores[0] = 100; // Intentional compile error: cannot modify through const reference.
}

int main()
{
    std::vector<int> scores{50};

    replaceFirst(scores);
}
