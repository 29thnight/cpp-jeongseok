#include <iostream>

class MarkerPair {
private:
    int first_;
    int second_;

public:
    MarkerPair()
        : first_{7}, second_{first_ + 1}
    {
        std::cout << "body: " << first_ << ' ' << second_ << '\n';
    }
};

int main()
{
    MarkerPair markers{};

    std::cout << "ready\n";
}
