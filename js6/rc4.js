
window.wpbd_setup_rc4 = (key) => {
    var tmp,x,y;
    var keylen=key.length;
    var state={"buf":Array(256)}
    if(keylen>256){
        keylen=256;
    }
    for(x=0;x<256;x++){
        state.buf[x]=x;
    }
    state.x=state.y=0;

    for(x=y=0;x<256;x++){
        y=(y+state.buf[x]+key.charCodeAt(x%keylen))&255;
        tmp=state.buf[x];
        state.buf[x]=state.buf[y];
        state.buf[y]=tmp;
    }
    state.x=x;
    state.y=y;
    return state;
}
window.wpbd_endecrypt_rc4_state = (buf,len,state) => {
    buf=buf.split("");
    var x=state.x;
    var y=state.y;
    var i;
    var s=state.buf;
    var tmp;
    for(i=0;i<len;i++){
        x=(x+1)&255;
        y=(y+s[x])&255;
        tmp=s[x];
        s[x]=s[y];
        s[y]=tmp;
        buf[i]=String.fromCharCode(255&buf[i].charCodeAt(0)^s[(s[x]+s[y])&255]);
    }
    state.x=x;
    state.y=y;
    return buf.join("");
}
window.wpbd_endecrypt_rc4 = (buf,len) => {
    state=wpbd_setup_rc4(wpbd.key);
    return wpbd_endecrypt_rc4_state(buf, len, state);
}



/*
int main(void)
{
	TRC4State state;
	unsigned char buf[100000];
	static char key[] = "QuenchHollow";
	FILE *f;
	size_t n;

	setup_rc4(&state, key, strlen(key));
	f = fopen("Eg/2014/test2.bdc", "rb");
	if (!f) {
		fprintf(stderr, "can't open input file\n");
		return 1;
	}
	n = fread(buf, 1, sizeof buf, f);
	fclose(f);
	buf[n] = '\0';

	endecrypt_rc4(buf, n, &state);
	printf("decrypted text:%s\n", buf);
	return 0;
}
*/
