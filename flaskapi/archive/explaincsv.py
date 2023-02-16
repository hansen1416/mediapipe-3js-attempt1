import pandas as pd



if __name__ == "__main__":
    
    df = pd.read_csv('out_rotations.csv', index_col='Time')

    # print(df)

    main_joints = [
'neck.X','neck.Y','neck.Z',
# 'neck1.X','neck1.Y','neck1.Z',
'head.X','head.Y','head.Z',

# 'lCollar.X', 'lCollar.Y', 'lCollar.Z', 
'lShldr.X', 'lShldr.Y', 'lShldr.Z', 'lForeArm.X', 'lForeArm.Y', 'lForeArm.Z', 'lHand.X', 'lHand.Y', 'lHand.Z', 

# 'rCollar.X', 'rCollar.Y', 'rCollar.Z', 
'rShldr.X', 'rShldr.Y', 'rShldr.Z', 'rForeArm.X', 'rForeArm.Y', 'rForeArm.Z', 'rHand.X', 'rHand.Y', 'rHand.Z',

# 'chest.X','chest.Y','chest.Z', 'abdomen.X','abdomen.Y','abdomen.Z',
'hip.X', 'hip.Y', 'hip.Z',

# 'lButtock.X', 'lButtock.Y', 'lButtock.Z',
"lThigh.X","lThigh.Y","lThigh.Z","lShin.X","lShin.Y","lShin.Z","lFoot.X","lFoot.Y","lFoot.Z",
# 'rButtock.X', 'rButtock.Y', 'rButtock.Z',
"rThigh.X", "rThigh.Y","rThigh.Z", "rShin.X","rShin.Y","rShin.Z","rFoot.X","rFoot.Y","rFoot.Z",
]

    zero_joints = [
'neck1.X', 'neck1.Y', 'neck1.Z', 
'lCollar.X', 'lCollar.Y', 'lCollar.Z', 'rCollar.X', 'rCollar.Y', 'rCollar.Z', 
'chest.X', 'chest.Y', 'chest.Z', 'abdomen.X', 'abdomen.Y', 'abdomen.Z', 
'lButtock.X', 'lButtock.Y', 'lButtock.Z', 'rButtock.X', 'rButtock.Y', 'rButtock.Z'
] 

    # for col in main_joints:
        
    #     if not df[col].all():
    #         zero_joints.append(col)
    #         # print(df[col])
    #         # print("==============")

    # print(zero_joints)

