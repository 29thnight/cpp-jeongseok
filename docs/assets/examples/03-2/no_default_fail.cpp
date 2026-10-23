class Ticket {
private:
    int number_;

public:
    explicit Ticket(int number)
        : number_{number}
    {
    }

    int number() const
    {
        return number_;
    }
};

int main()
{
    Ticket ticket{}; // Intentional: no constructor accepts zero arguments.
}
