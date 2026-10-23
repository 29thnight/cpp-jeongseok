class Meter {
private:
    int level_{30};

public:
    int level() const
    {
        return level_;
    }
};

int main()
{
    Meter meter{};

    meter.level_ = 150; // Intentional access error.
}
