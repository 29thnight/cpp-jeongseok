#include <iostream>

int main()
{
    for (int value{1}; value <= 5; ++value) {
        if (value == 3) {
            continue;
        }

        if (value == 5) {
            break;
        }

        std::cout << value << '\n';
    }

    std::cout << "Done" << '\n';
}
