#include <iostream>

int main()
{
    int tickets{2};
    int required{2};
    bool hasTickets{tickets >= required};
    bool connected{true};
    bool canStart{hasTickets && connected};
    bool needsAttention{!connected || tickets == 0};

    std::cout << std::boolalpha;
    std::cout << hasTickets << std::endl;
    std::cout << canStart << std::endl;
    std::cout << needsAttention << std::endl;
}
