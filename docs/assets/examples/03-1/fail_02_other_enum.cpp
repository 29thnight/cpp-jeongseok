enum class TaskState {
    Todo,
    Doing,
    Done
};

enum class ReviewState {
    Todo,
    Done
};

int main() {
    TaskState state = ReviewState::Done; // 의도한 오류: 서로 다른 열거형
}
