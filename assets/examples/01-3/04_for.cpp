#include <iostream>

int main()
{
    const int count{3};

    for (int step{0}; step < count; ++step) {
        std::cout << step << '\n';
    }

    std::cout << "Done" << '\n';
}
