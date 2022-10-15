import os
import time

import oss2
from oss2 import SizedFileAdapter, determine_part_size
from oss2.models import PartInfo

from ropes import logger, redis_client, VIDEO_MIME_EXT

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

    def multi_part_upload(self, key, tmp_filename, mimetype):

        # # 填写不能包含Bucket名称在内的Object完整路径，例如exampledir/exampleobject.txt。
        # key = 'exampledir/exampleobject.txt'

        assert mimetype in VIDEO_MIME_EXT, "unknown video mimetype {}".format(mimetype)

        key = key + '.' + VIDEO_MIME_EXT[mimetype]

        logger.info("start multi_part_upload file {} from {}".format(key, tmp_filename))

        total_size = os.path.getsize(tmp_filename)

        preferred_size = 10 * 1024 * 1024 if os.getenv('FLASK_DEBUG') else 40 * 1024 * 1024

        # determine_part_size方法用于确定分片大小。
        part_size = determine_part_size(total_size, preferred_size=40 * 1024 * 1024)

        # 初始化分片。
        # 如需在初始化分片时设置文件存储类型，请在init_multipart_upload中设置相关Headers，参考如下。
        headers = dict()
        headers['Content-Type'] = mimetype + '; charset=UTF-8'

        # 指定该Object的网页缓存行为。
        # headers['Cache-Control'] = 'no-cache'
        # 指定该Object被下载时的名称。
        # headers['Content-Disposition'] = 'oss_MultipartUpload.txt'
        # 指定该Object的内容编码格式。
        # headers['Content-Encoding'] = 'utf-8'
        # 指定过期时间，单位为毫秒。
        # headers['Expires'] = '1000'
        # 指定初始化分片上传时是否覆盖同名Object。此处设置为true，表示禁止覆盖同名Object。
        # headers['x-oss-forbid-overwrite'] = 'true'
        # 指定上传该Object的每个Part时使用的服务器端加密方式。
        # headers[OSS_SERVER_SIDE_ENCRYPTION] = SERVER_SIDE_ENCRYPTION_KMS
        # 指定Object的加密算法。如果未指定此选项，表明Object使用AES256加密算法。
        # headers[OSS_SERVER_SIDE_DATA_ENCRYPTION] = SERVER_SIDE_ENCRYPTION_KMS
        # 表示KMS托管的用户主密钥。
        # headers[OSS_SERVER_SIDE_ENCRYPTION_KEY_ID] = '9468da86-3509-4f8d-a61e-6eab1eac****'
        # 指定Object的存储类型。
        # headers['x-oss-storage-class'] = oss2.BUCKET_STORAGE_CLASS_STANDARD
        # 指定Object的对象标签，可同时设置多个标签。
        # headers[OSS_OBJECT_TAGGING] = 'k1=v1&k2=v2&k3=v3'
        # upload_id = bucket.init_multipart_upload(key, headers=headers).upload_id

        upload_id = self.bucket.init_multipart_upload(key).upload_id
        parts = []

        # 逐个上传分片。
        with open(tmp_filename, 'rb') as fileobj:
            part_number = 1
            offset = 0
            while offset < total_size:
                num_to_upload = min(part_size, total_size - offset)
                # 调用SizedFileAdapter(fileobj, size)方法会生成一个新的文件对象，重新计算起始追加位置。
                result = self.bucket.upload_part(key, upload_id, part_number,
                                            SizedFileAdapter(fileobj, num_to_upload))
                parts.append(PartInfo(part_number, result.etag))

                offset += num_to_upload
                part_number += 1

                redis_client.setex(key + ':progress', 180, round((offset / total_size) * 100, 2))

                logger.info("{} upload in progress {}".format(key, offset))


        # 完成分片上传。
        # 如需在完成分片上传时设置相关Headers，请参考如下示例代码。
        headers = dict()
        # 设置文件访问权限ACL。此处设置为OBJECT_ACL_PRIVATE，表示私有权限。
        # headers["x-oss-object-acl"] = oss2.OBJECT_ACL_PRIVATE
        self.bucket.complete_multipart_upload(key, upload_id, parts, headers=headers)
        # bucket.complete_multipart_upload(key, upload_id, parts)

        # this was a temp file
        os.unlink(tmp_filename)
        
        redis_client.setex(key + ':progress', 180, 100)

        redis_client.rpush('video_to_process', 100)

        # 验证分片上传。
        # with open(filename, 'rb') as fileobj:
        #     assert self.bucket.get_object(key).read() == fileobj.read()

