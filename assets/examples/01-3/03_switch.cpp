#include <iostream>

int main()
{
    const int command{2};

    switch (command) {
    case 1: {
        std::cout << "Attack" << '\n';
        break;
    }
    case 2: {
        std::cout << "Defend" << '\n';
        break;
    }
    default: {
        std::cout << "Wait" << '\n';
        break;
    }
    }
}
