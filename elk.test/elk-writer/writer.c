#include <stdio.h>
#include <unistd.h>

int main()
{
	setbuf(stdout, NULL); // Disable buffering
	printf("Hello, World!\n");
	sleep(1);

	for (int i = 0; i < 2147483647; i++)
	{
		printf("i = %d\n", i);
		sleep(1);
	}
	return 0;
}
