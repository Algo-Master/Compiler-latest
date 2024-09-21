#include <bits/stdc++.h>
using namespace std;

signed main()
{
    //For proper execution
    int a = 17;
    while(a>0) {
        cout<<((a&1)==1? 1 : 0);
        a = a>>1;
    }
    // For running into a TLE
    // for(int i=0; i<1000000; i++) {
    //     for(int j = 0; j<1000; j++){

    //     }
    // }
    return 0;
}