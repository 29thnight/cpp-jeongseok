#include <iostream>

int main()
{
    int tokens{7};
    int people{2};
    int each{tokens / people};
    int leftover{tokens % people};

    std::cout << each << std::endl;
    std::cout << leftover << std::endl;
    std::cout << -7 / 3 << std::endl;
    std::cout << -7 % 3 << std::endl;
}
