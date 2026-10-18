#include <iostream>

int main()
{
    const int health{70};
    const int max_health{100};

    if (health < max_health) {
        std::cout << "Can heal" << '\n';
    } else {
        std::cout << "Already full" << '\n';
    }
}
