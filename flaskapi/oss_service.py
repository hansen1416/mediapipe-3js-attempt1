import os
import oss2


class OSSService:

    def __init__(self) -> None:
        # 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
        auth = oss2.Auth(os.getenv('ALIYUN_ACCESS_ID'), os.getenv('ALIYUN_ACCESS_SECRET'))
        # yourEndpoint填写Bucket所在地域对应的Endpoint。以华东1（杭州）为例，Endpoint填写为https://oss-cn-hangzhou.aliyuncs.com。
        # 填写Bucket名称。
        self.bucket = oss2.Bucket(auth, os.getenv('OSS_ENDPOINT'), os.getenv('OSS_BUCKET'))

    def simple_upload(self, fileobj):

        fileobj.seek(0, os.SEEK_SET)

        # 填写Object完整路径。Object完整路径中不能包含Bucket名称。
        result = self.bucket.put_object('exampleobject.txt', fileobj)

        # HTTP返回码。
        print('http status: {0}'.format(result.status))
        # 请求ID。请求ID是本次请求的唯一标识，强烈建议在程序日志中添加此参数。
        print('request_id: {0}'.format(result.request_id))
        # ETag是put_object方法返回值特有的属性，用于标识一个Object的内容。
        print('ETag: {0}'.format(result.etag))
        # HTTP响应头部。
        print('date: {0}'.format(result.headers['date']))

