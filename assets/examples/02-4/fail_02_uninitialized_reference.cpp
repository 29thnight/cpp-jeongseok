int main()
{
    int& score; // Intentional compile error: a reference needs an initializer.

    score = 80;
}
