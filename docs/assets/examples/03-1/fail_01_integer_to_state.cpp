enum class TaskState {
    Todo,
    Doing,
    Done
};

int main() {
    TaskState state = 1; // 의도한 오류: int에서 TaskState로 암시적 변환 불가
}
