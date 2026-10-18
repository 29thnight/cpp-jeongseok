#include <iostream>

int main()
{
    int remaining{3};

    while (remaining > 0) {
        std::cout << remaining << '\n';
        --remaining;
    }

    std::cout << "Done" << '\n';
}
