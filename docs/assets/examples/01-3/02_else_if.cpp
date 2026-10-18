#include <iostream>

int main()
{
    const int score{85};

    if (score >= 90) {
        std::cout << "Gold" << '\n';
    } else if (score >= 70) {
        std::cout << "Silver" << '\n';
    } else {
        std::cout << "Bronze" << '\n';
    }
}
