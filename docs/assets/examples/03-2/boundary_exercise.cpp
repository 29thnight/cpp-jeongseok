#include <iostream>

int boundedLevel(int requested)
{
    if (requested < 0) {
        return 0;
    }
    if (requested > 100) {
        return 100;
    }

    return requested;
}

class Volume {
private:
    int level_{30};

public:
    Volume() = default;

    explicit Volume(int initialLevel)
        : level_{boundedLevel(initialLevel)}
    {
    }

    int level() const
    {
        return level_;
    }

    void setLevel(int requested)
    {
        level_ = boundedLevel(requested);
    }
};

int main()
{
    Volume below{-1};
    Volume lowest{0};
    Volume highest{100};
    Volume above{101};

    std::cout << below.level() << ' ' << lowest.level() << ' '
              << highest.level() << ' ' << above.level() << '\n';

    Volume changed{};

    changed.setLevel(-1);
    std::cout << changed.level() << ' ';

    changed.setLevel(0);
    std::cout << changed.level() << ' ';

    changed.setLevel(100);
    std::cout << changed.level() << ' ';

    changed.setLevel(101);
    std::cout << changed.level() << '\n';
}
